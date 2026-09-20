'use strict';
/**
 * KFC Türkiye – "KFSOOO Menüler / Yeni Çifte Cruncher Menü" 970x250 interaktif banner
 * Kaynak görsel: assets/kfsooo/kv-1200.jpg (kampanya KV'si). Türetilen parçalar: assets/kfsooo-derived/
 */
module.exports = {
  brand: {
    name: 'KFC Türkiye',
    url: 'https://www.kfcturkiye.com/kfsooo?utm_source=display&utm_medium=banner&utm_campaign=kfsooo-cifte-cruncher&utm_content=970x250',
    red: '#e4002b',
  },
  copy: {
    yeni: 'YENİ',
    title: 'ÇİFTE CRUNCHER MENÜ',
    perLabel: 'Kişi Başı',
    totalLabel: 'Toplam',
    perPrice: 155,
    totalPrice: 310,
    perSub: 'Toplam <b>310 TL</b> · 2 kişilik menü',
    totalSub: 'Kişi başı <b>155 TL</b> · 2 kişilik menü',
    cta: 'Menüyü keşfet',
    infoLabel: 'Kampanya koşulları',
    // Her zaman görünen yasal şerit (KV'deki metnin ilk cümleleri) ve tam metin (i düğmesi)
    legalStrip: 'Sağlığınız için aşırı şeker, yağ ve tuz tüketiminizi azaltınız. Fiyatlar 15 Eylül – 15 Ekim 2026 tarihleri arasında, kampanyaya katılan restoranlar ve gel-al servisinde geçerlidir. Ürün görselleri temsilidir. Detaylar: kfcturkiye.com/kfsooo',
    legalFull: 'Sağlığınız için aşırı şeker, yağ ve tuz tüketiminizi azaltınız. Fiyatlar 15 Eylül – 15 Ekim 2026 tarihleri arasında, kampanyaya katılan restoranlar ve gel-al servisinde geçerlidir. Ürün görselleri temsilidir. Menü içeriği ve detaylı kampanya koşulları için: kfcturkiye.com/kfsooo. Coca-Cola, The Coca-Cola Company’nin tescilli markasıdır. © 2026 The Coca-Cola Company.',
    replay: 'Tekrar izle',
    aria: 'KFC KFSOOO Menüler – Yeni Çifte Cruncher Menü, kişi başı 155 TL, toplam 310 TL. Menüyü keşfet.',
  },
  assets: {
    photo: 'assets/kfsooo-derived/photo.jpg',
    bg: 'assets/kfsooo-derived/bg.jpg',
    sticker: 'assets/kfsooo-derived/sticker.png',
    cola: 'assets/kfsooo-derived/cola.png',
    avatarA: 'assets/kfsooo-derived/avatar-a.png',
    avatarB: 'assets/kfsooo-derived/avatar-b.png',
    fonts: [
      { family: 'National 2 Condensed', weight: 400, file: 'assets/kfc/fonts/089-national2condensedbold-s-p-01sg1ea-60rdi.woff2' },
      { family: 'National 2', weight: 500, file: 'assets/kfc/fonts/082-national2medium-s-p-0xsq9z9ef-kli.woff2' },
      { family: 'National 2', weight: 700, file: 'assets/kfc/fonts/080-national2bold-s-p-0eeuqsndmx-aa.woff2' },
    ],
  },
  // Fotoğraf yerleşimi: KV 1100 px kare; bannerda ölçek ve konum
  photo: { left: 60, width: 840, beats: { top: 22, faces: 165, tray: 525 } }, // beats: KV (1200 tabanlı) piksel cinsinden pencere üstü
  timing: { sticker: 350, title: 1200, price: 2300, sub: 3100, tray: 3300, cta: 4000, back: 5600, autoTotal: 6300, autoPer: 9300, hold: 13000, loops: 3 },
};
