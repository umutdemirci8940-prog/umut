'use strict';
/**
 * İlaçsız Yaşam – Kasım 2026 interaktif masthead (970x250) ve mobil (320x480) çalışmaları
 * Metinler, segmentler, ürünler ve tıklama adresleri. Düzenleyip `node tools/build-rich.js` çalıştırın.
 *
 * Sağlık beyanları yalnızca Türk Gıda Kodeksi / EFSA onaylı beyan listesinden seçildi;
 * yayın öncesi markanın regülasyon onayı alınmalıdır.
 */
const SITE = 'https://ilacsizyasam.com';
const utm = (content) => `utm_source=display&utm_medium=rich_media&utm_campaign=kasim_2026&utm_content=${content}`;
const link = (p, content) => `${SITE}${p}${p.includes('?') ? '&' : '?'}${utm(content)}`;

module.exports = {
  utm,
  link,
  brand: {
    name: 'İlaçsız Yaşam',
    by: 'Dr. Ümit Aktaş Ürünleri Resmi Satış Noktası',
    headline: "Kasım'da kendine iyi bak.",
    sub: 'Sana uygun rutini seç, keşfet.',
    legal: 'Takviye edici gıdalar ilaç değildir. Hastalıkların önlenmesi veya tedavi edilmesi amacıyla kullanılmaz.',
    home: link('/collections/gida-takviyeleri', 'genel'),
  },
  coupon: {
    over: 'Yeni üyelere',
    pct: '%10',
    text: 'ilk alışverişte indirim',
    code: 'YENIUYE10',
    copied: 'Kod kopyalandı',
    url: link('/collections/en-cok-satanlar', 'kupon'),
  },
  // Segment → fotoğraf (assets/rich/<prefix>-<key>.webp), onaylı sağlık beyanı, ürünler, açılış sayfası
  segments: [
    {
      key: 'yetiskin',
      over: 'Günlük enerji',
      title: 'Yetişkin',
      claim: 'B12 vitamini yorgunluk ve bitkinliğin azalmasına katkıda bulunur.',
      cta: 'Rutinini keşfet',
      path: '/collections/vitamin-takviyeleri',
      focus: '42% 40%',
      mini: '38% 45%',
      products: [
        { key: 'b12', name: 'Vitamin B12 & Folik Asit', path: '/products/vitamin-b12-metilfolat' },
        { key: 'omega3', name: 'Omega 3', path: '/products/omega-3-33-22-60-kapsul' },
        { key: 'mvwomen', name: 'Multivitamin Women', path: '/products/multivitamin-women' },
      ],
    },
    {
      key: 'bagisiklik',
      over: 'Kışa hazırlık',
      title: 'Bağışıklık',
      claim: 'C vitamini ve çinko bağışıklık sisteminin normal fonksiyonuna katkıda bulunur.',
      cta: 'Kışa hazırlan',
      path: '/collections/mineral-takviyeleri',
      focus: '55% 55%',
      mini: '92% 50%',
      products: [
        { key: 'vitc', name: 'Vitamin C', path: '/products/vitamin-c' },
        { key: 'cinko', name: 'Çinko', path: '/products/cinko' },
        { key: 'propolis', name: 'Propolis', path: '/products/propolis-kapsul' },
      ],
    },
    {
      key: 'cocuk',
      over: 'Miniklere destek',
      title: 'Çocuk & Aile',
      claim: 'D vitamini çocuklarda kemiklerin normal büyüme ve gelişimi için gereklidir.',
      cta: 'Aile rutinini gör',
      path: '/products/gelisim-paketi',
      focus: '50% 50%',
      mini: '78% 70%',
      products: [
        { key: 'omega3surup', name: 'Omega 3 Şurup', path: '/products/omega-3-surup' },
        { key: 'd3', name: 'Vitamin D3 Damla', path: '/products/vitamin-d3-damla' },
      ],
    },
    {
      key: 'aktif',
      over: 'Spor & hareket',
      title: 'Aktif Yaşam',
      claim: 'Magnezyum normal kas fonksiyonuna katkıda bulunur.',
      cta: 'Formunu destekle',
      path: '/collections/omegalar-probiyotik',
      focus: '50% 55%',
      mini: '22% 40%',
      products: [
        { key: 'magnezyum', name: 'Magnezyum', path: '/products/magnezyum' },
        { key: 'krill', name: 'Krill Yağı', path: '/products/krill-yagi' },
        { key: 'spirulina', name: 'Spirulina', path: '/products/spirulina' },
      ],
    },
  ],
};
