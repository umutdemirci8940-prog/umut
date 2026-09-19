'use strict';
/**
 * KFC Türkiye – "Kepenkler yeniden açılıyor" 970x250 interaktif banner
 * Tüm metinler, bağlantılar, süreler ve varlık seçimleri burada.
 * Varlık dosyaları assets/kfc/ altından (GitHub Actions ile siteden / arşivden toplanır) okunur;
 * `url` alanı "linked" modda doğrudan sitedeki adresi kullanır.
 */
module.exports = {
  brand: {
    name: 'KFC Türkiye',
    site: 'https://www.kfcturkiye.com',
    // Tıklama hedefi: en yakın restoranı bul
    url: 'https://www.kfcturkiye.com/restoranlar?utm_source=display&utm_medium=banner&utm_campaign=yeniden-acilis&utm_content=970x250',
    red: '#e4002b',
    dark: '#1c1414',
  },
  copy: {
    closed: 'KAPALI',
    open: 'AÇIK',
    handleHint: 'Kepengi kaldır',
    kicker: 'BU LEZZETİ ÖZLEDİN Mİ?',           // sitenin açılış öncesi mesajından
    headline: 'KFC GERİ DÖNDÜ!',
    stamp: 'YENİDEN AÇILDI',
    sub: 'Şubelerimiz Türkiye genelinde birer birer yeniden açılıyor.',
    // Yeni dönemde açılış duyurulan şehirler (arşivdeki restoran sayfaları eski döneme ait olduğu için sınırlı tutuldu)
    cities: ['İstanbul', 'Ankara', 'İzmir'],
    citiesLabel: 'Sana en yakın şube',
    cta: 'En yakın KFC’yi bul',
    replay: 'Tekrar izle',
    aria: 'KFC Türkiye – şubelerimiz yeniden açılıyor. En yakın KFC’yi bul.',
  },
  // Varlık seçimleri: dosya yolları assets/kfc/ köküne göre; url alanı siteden doğrudan erişim için
  assets: {
    // Sitenin og görselindeki KFC yazı logosu (beyaz fon şeffaflaştırıldı: tools/kfc-derive.js)
    logo: { file: '../kfc-derived/logo-wordmark.png', url: null },
    video: { file: null, url: null },
    // Sitenin "hakkımızda" sayfasındaki restoran fotoğrafı – kepenk açılınca ortaya çıkar
    hero: { file: 'img/140-image.jpg', url: 'https://www.kfcturkiye.com/img/about-image-2.jpg', pos: '50% 58%' },
    // Sitenin kendi fontları (National 2) – /_next/static/media altından
    font: {
      headFamily: 'National 2 Condensed',
      textFamily: 'National 2',
      faces: [
        { family: 'National 2 Condensed', weight: 400, file: 'fonts/089-national2condensedbold-s-p-01sg1ea-60rdi.woff2', url: 'https://www.kfcturkiye.com/_next/static/media/National2CondensedBold-s.p.01sg1ea~60rdi.woff2' },
        { family: 'National 2', weight: 500, file: 'fonts/082-national2medium-s-p-0xsq9z9ef-kli.woff2', url: 'https://www.kfcturkiye.com/_next/static/media/National2Medium-s.p.0xsq9z9ef_kli.woff2' },
        { family: 'National 2', weight: 700, file: 'fonts/080-national2bold-s-p-0eeuqsndmx-aa.woff2', url: 'https://www.kfcturkiye.com/_next/static/media/National2Bold-s.p.0eeuqsndmx.aa.woff2' },
      ],
    },
    // Sitedeki şeffaf ürün fotoğrafları (menü sayfaları)
    products: [
      { key: 'kova', name: 'Kanatlandıran Kova', file: 'img/176-image.png', url: 'https://www.kfcturkiye.com/_next/image?url=https%3A%2F%2Ffiles.pidem.prod.hebiar.com%2Fkfc%2Fcontent%2Fproduct%2Fimg%2Fkanatlandiran-kova-20251208121146.png&w=640&q=75', x: 500, y: -6, h: 238, depth: 1, rot: -1.5, delay: 0 },
      { key: 'zinger', name: 'Double Zinger Burger', file: 'img/231-image.png', url: 'https://www.kfcturkiye.com/_next/image?url=%2Fimg%2Fproducts%2Fdouble_zinger_burger.png&w=640&q=75', x: 712, y: 46, h: 182, depth: .65, rot: 2.5, delay: 170 },
      { key: 'wings', name: '8’li Hot Wings', file: 'img/166-image.png', url: 'https://www.kfcturkiye.com/_next/image?url=%2Fimg%2Fproducts%2F8-hot-wings.png&w=640&q=75', x: 842, y: 116, h: 136, depth: .45, rot: -3, delay: 340 },
    ],
    steam: [{ x: 560, y: -70 }, { x: 740, y: -50 }],
  },
  timing: {
    shutterOpen: 900,     // kepenk kalkmaya başlar (ms)
    autoOpenWait: 500,    // kullanıcı sürüklemezse kaç ms sonra kendisi açılır
    headline: 1900,
    stamp: 2700,
    products: 3100,
    sub: 3900,
    cta: 4500,
    hold: 9000,           // son kare bekleme
    cycle: 15000,         // döngü süresi (kepenk iner, yeniden başlar)
    loops: 3,             // kaç kez döner, sonra son karede durur
  },
};
