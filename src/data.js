'use strict';
/**
 * İlaçsız Yaşam – Gıda Takviyesi Banner Serisi
 * ---------------------------------------------------------------
 * Marka metinleri, ürün listesi ve zamanlama ayarları.
 * Bu dosyayı düzenleyip `node build.js` çalıştırmanız yeterlidir;
 * üç boyut (300x250, 300x600, 970x250) otomatik olarak yeniden üretilir.
 */
module.exports = {
  brand: {
    name: 'İlaçsız Yaşam',
    by: 'Dr. Ümit Aktaş',
    // Varlıkların (görsel, logo, fiyat) çekildiği mağaza adresi (tools/fetch-assets.js).
    site: 'https://ilacsizyasam.com',
    // Tıklama hedefi. Reklam ağı clickTag sağlıyorsa o kullanılır (bkz. README).
    url: 'https://ilacsizyasam.com/collections/gida-takviyeleri?utm_source=display&utm_medium=banner&utm_campaign=gida-takviyeleri',
    domain: 'ilacsizyasam.com',
    // Ürün kartında fiyat gösterilsin mi? (assets/manifest.json'daki güncel fiyat kullanılır)
    showPrice: false,
    // Ürün kartındayken tıklama ilgili ürün sayfasına gitsin mi? (clickTag tanımlıysa yine clickTag kullanılır)
    deepLink: true,
    headline: 'Doğadan gelen günlük destek',
    intro: 'Dr. Ümit Aktaş formülleriyle bitkisel gıda takviyeleri',
    cta: 'Ürünleri İncele',
    ctaFinal: 'Hemen Keşfet',
    promo: 'Üyelere özel avantajlar',
    // Türkiye reklam mevzuatı gereği takviye edici gıda reklamlarında yer alması gereken ibare.
    legal: 'Takviye edici gıdalar ilaç değildir. Hastalıkların önlenmesi veya tedavi edilmesi amacıyla kullanılmaz.',
    // 300x250 gibi dar alanlarda kullanılan kısa sürüm.
    legalShort: 'Takviye edici gıdalar ilaç değildir.',
  },

  // Süreler milisaniye cinsindendir.
  timing: {
    intro: 2600,        // Açılış (logo + başlık) süresi
    slide: 3200,        // Her ürün kartının ekranda kalma süresi
    outro: 3600,        // Kapanış (CTA) süresi
    maxAutoplay: 30000, // Toplam otomatik oynatma sınırı, ms (Google Ads: en fazla 30 sn). 0 = sınırsız döngü
  },

  /**
   * Ürün slider'ı. Sıra, ekrandaki sıradır. İstediğiniz kadar ürün ekleyebilirsiniz.
   *  - key    : Dosya/kimlik adı (assets/products/<key>.jpg)
   *  - handle : Sitedeki ürün adresi (ilacsizyasam.com/products/<handle>); görsel ve fiyat buradan çekilir
   *  - name   : Kart başlığı
   *  - short  : Şişe etiketindeki kısa ad (büyük harf önerilir)
   *  - claim  : Kısa fayda cümlesi (EFSA onaylı sağlık beyanlarına yakın, ilaç çağrışımı yapmayan ifadeler seçildi)
   *  - badge  : Rozet metni ("Çok Satan", "Yeni" vb.)
   *  - color  : Ürünün ana rengi (etiket bandı, rozet, arka plan ışığı)
   *  - accent : Aynı ürünün açık tonu
   */
  products: [
    {
      key: 'magnezyum',
      handle: 'magnezyum',
      name: 'Magnezyum',
      short: 'MAGNEZYUM',
      claim: 'Yorgunluk ve bitkinliğin azalmasına katkıda bulunur.',
      badge: 'Çok Satan',
      color: '#2f8f5b',
      accent: '#bfe3cc',
    },
    {
      key: 'safran',
      handle: 'safran-ekstresi',
      name: 'Safran Ekstresi',
      short: 'SAFRAN',
      claim: 'Günlük denge ve iyi hissetme rutininiz için.',
      badge: 'Çok Satan',
      color: '#d9542b',
      accent: '#ffd3b8',
    },
    {
      key: 'd3k2',
      handle: 'd3-k2-vitamin-damlasi',
      name: 'D3 & K2 Vitamini',
      short: 'D3 + K2',
      claim: 'Kemiklerin ve bağışıklık sisteminin normal işlevine katkıda bulunur.',
      badge: 'Popüler',
      color: '#d99a1e',
      accent: '#ffe9b3',
    },
    {
      key: 'b12',
      handle: 'vitamin-b12-metilfolat',
      name: 'B12 & Folik Asit',
      short: 'B12 + FOLİK',
      claim: 'Normal enerji metabolizmasına katkıda bulunur.',
      badge: 'Enerji',
      color: '#c4344c',
      accent: '#ffcdd6',
    },
    {
      key: 'omega3',
      handle: 'omega-3-33-22-60-kapsul',
      name: 'Omega 3',
      short: 'OMEGA 3',
      claim: 'EPA ve DHA ile kalbin normal fonksiyonuna katkıda bulunur.',
      badge: 'Öne Çıkan',
      color: '#2878b0',
      accent: '#cfe6f8',
    },
  ],
};
