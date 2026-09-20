'use strict';
/**
 * KFC Türkiye – "KFSOOO Menüler / Yeni Çifte Cruncher Menü" 970x250 – medya öncelikli interaktif banner (v2)
 * Kaynaklar: kampanya KV'si (assets/kfsooo/kv-1200.jpg), sitenin dört kampanya filmi (assets/kfc-pages/video),
 * sitenin şeffaf ürün fotoğrafı (assets/kfc/img/226 – Çifte Cruncher Menü), sitenin fontları.
 */
module.exports = {
  brand: {
    name: 'KFC Türkiye',
    url: 'https://www.kfcturkiye.com/kfsooo?utm_source=display&utm_medium=banner&utm_campaign=kfsooo-cifte-cruncher&utm_content=970x250',
    red: '#e4002b',
  },
  copy: {
    kin: 'KFSOOO',
    yeni: 'YENİ',
    title: 'ÇİFTE CRUNCHER MENÜ',
    perLabel: 'Kişi Başı',
    totalLabel: 'Toplam',
    perPrice: 155,
    totalPrice: 310,
    perSub: 'Toplam <b>310 TL</b> · 2 kişilik menü',
    totalSub: 'Kişi başı <b>155 TL</b> · 2 kişilik menü',
    splitTag: 'KİŞİ BAŞI',
    totalTag: 'TOPLAM · 2 KİŞİLİK MENÜ',
    productName: 'Çifte Cruncher Menü',
    cta: 'Menüyü keşfet',
    infoLabel: 'Kampanya koşulları',
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
    // Sitedeki şeffaf ürün fotoğrafı (menü sayfası)
    product: { file: 'assets/kfc/img/226-image.png', url: 'https://www.kfcturkiye.com/_next/image?url=https%3A%2F%2Ffiles.pidem.prod.hebiar.com%2Fkfc%2Fcontent%2Fproduct%2Fimg%2Fc-i-fte-cruncher-menu-_png_1600x1600-20260719214730.png&w=640&q=75' },
    // Sitenin ana sayfa kampanya filmleri – 970x250 kesit, 12 sn, sessiz (GitHub Actions'ta ffmpeg)
    films: [
      { key: 'double-zinger', name: 'Double Zinger', file: 'assets/kfc-pages/video/008-double-zinger-1920x840-20260325145344-970x250.mp4', webm: 'assets/kfc-pages/video/008-double-zinger-1920x840-20260325145344-970x250.webm', thumb: 'assets/kfsooo-derived/thumb-double-zinger.jpg', url: 'https://files.pidem.prod.hebiar.com/kfc/content/content/video/double-zinger_1920x840-20260325145344.mp4' },
      { key: 'strips', name: 'Strips', file: 'assets/kfc-pages/video/011-strips-1920x840-20260325144827-970x250.mp4', webm: 'assets/kfc-pages/video/011-strips-1920x840-20260325144827-970x250.webm', thumb: 'assets/kfsooo-derived/thumb-strips.jpg', url: 'https://files.pidem.prod.hebiar.com/kfc/content/content/video/strips_1920x840-20260325144827.mp4' },
      { key: 'mighty-cruncher', name: 'Mighty Cruncher', file: 'assets/kfc-pages/video/015-mighty-cruncher-1920x840-20260325145206-970x250.mp4', webm: 'assets/kfc-pages/video/015-mighty-cruncher-1920x840-20260325145206-970x250.webm', thumb: 'assets/kfsooo-derived/thumb-mighty-cruncher.jpg', url: 'https://files.pidem.prod.hebiar.com/kfc/content/content/video/mighty-cruncher_1920x840-20260325145206.mp4' },
      { key: 'hot-shots', name: 'Hot Shots', file: 'assets/kfc-pages/video/019-hotshot-1920x840-20260325145451-970x250.mp4', webm: 'assets/kfc-pages/video/019-hotshot-1920x840-20260325145451-970x250.webm', thumb: 'assets/kfsooo-derived/thumb-hot-shots.jpg', url: 'https://files.pidem.prod.hebiar.com/kfc/content/content/video/hotshot_1920x840-20260325145451.mp4' },
    ],
    fonts: [
      { family: 'National 2 Condensed', weight: 400, file: 'assets/kfc/fonts/089-national2condensedbold-s-p-01sg1ea-60rdi.woff2' },
      { family: 'National 2', weight: 500, file: 'assets/kfc/fonts/082-national2medium-s-p-0xsq9z9ef-kli.woff2' },
      { family: 'National 2', weight: 700, file: 'assets/kfc/fonts/080-national2bold-s-p-0eeuqsndmx-aa.woff2' },
    ],
  },
  photo: { left: 60, width: 840, faces: 165 }, // KV: "ikiye bölünme" anında görünür; faces = pencere üstü (1200 tabanlı KV pikseli)
  timing: {
    kin: 250, kinStep: 100, kinOut: 1300, sticker: 1450, film1: 1700, title: 1900,
    product: 2600, burst: 3150, price: 3500, sub: 4300,
    split: 4900, bar: 5100, sideLabels: 5350, merge: 6150,
    endFrame: 7100, autoPer: 8800, film3: 9600, autoTotal: 11300, film0: 12100,
    montage: 2500, hold: 14000, loops: 3,
  },
};
