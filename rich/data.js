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

  /**
   * Yaratıcı set (Kasım): Merceği gezdir, Dr. Ümit Aktaş'ın ofisi, Rutin eşleştir.
   * creative(content) → UTM'leri çalışmaya göre çözülmüş veri.
   */
  creative(content) {
    const L = (p, k) => link(p, `${content}_${k}`);
    return {
      // Her an (ön fotoğraf) → mercek altında beliren ürün sahnesi (arka fotoğraf)
      lens: [
        { key: 'gunes', bf: [.42, .5],  moment: 'Gri Kasım günleri', img: 'img/l-gri.webp', back: 'img/l-gri-b.webp', product: 'Vitamin D3 & K2 Damla',
          line: 'Güneş azaldıysa D vitamini rutini.', claim: 'D vitamini bağışıklık sisteminin normal fonksiyonuna katkıda bulunur.', url: L('/products/d3-k2-vitamin-damlasi', 'gunes') },
        { key: 'enerji', bf: [.4, .6], moment: 'Yorgun bir pazartesi', img: 'img/l-enerji.webp', back: 'img/l-enerji-b.webp', product: 'Vitamin B12 & Folik Asit',
          line: 'Enerjinin arkasındaki küçük tablet.', claim: 'B12 vitamini yorgunluk ve bitkinliğin azalmasına katkıda bulunur.', url: L('/products/vitamin-b12-metilfolat', 'enerji') },
        { key: 'cocuk', bf: [.62, .42], moment: 'Okul, park, koşu', img: 'img/l-cocuk.webp', back: 'img/l-cocuk-b.webp', product: 'Omega 3 Şurup',
          line: 'Minikler için yeni tadıyla.', claim: 'DHA, normal beyin fonksiyonunun korunmasına katkıda bulunur.', url: L('/products/omega-3-surup', 'cocuk') },
        { key: 'hareket', bf: [.4, .45], moment: 'Pilates sonrası', img: 'img/l-aktif.webp', back: 'img/l-aktif-b.webp', product: 'Krill Yağı',
          line: 'Hareketin kırmızı kapsülü.', claim: 'EPA ve DHA kalbin normal fonksiyonuna katkıda bulunur.', url: L('/products/krill-yagi', 'hareket') },
      ],
      // Ofis fotoğrafındaki gerçek nesneler (x, y: fotoğraf genişliği/yüksekliği oranı)
      office: [
        { key: 'kitaplik', x: .13, y: .52, label: 'Kitaplık', title: "Dr. Ümit Aktaş'ın kitapları", text: 'İlaçsız Yaşam, Mutluluk Kürleri ve daha fazlası.', imgs: ['img/b-ilacsiz.webp', 'img/b-mutluluk.webp', 'img/b-bitkisel.webp'], cta: 'Kitapları gör', url: L('/collections/kitaplar', 'kitaplik') },
        { key: 'heykel', x: .75, y: .2, label: 'Yoga heykeli', title: 'Huzur köşesi', text: 'Akşam rutinine Magnezyum ve Safran Ekstresi.', imgs: ['img/p-magnezyum.webp', 'img/p-safran.webp'], cta: 'Huzur Ritüeli', url: L('/products/huzur-ritueli-paketi', 'heykel') },
        { key: 'stetoskop', x: .42, y: .66, label: 'Stetoskop', title: 'İmzalı takviyeler', text: 'Dr. Ümit Aktaş formülleriyle günlük rutin.', imgs: ['img/p-omega3.webp', 'img/p-d3k2.webp', 'img/p-vitc.webp'], cta: 'Takviyeleri keşfet', url: L('/collections/gida-takviyeleri', 'stetoskop') },
        { key: 'oyuncak', x: .715, y: .53, label: 'Raftaki oyuncak', title: 'Miniklere destek', text: 'Omega 3 Şurup ve Vitamin D3 Damla.', imgs: ['img/p-omega3surup.webp', 'img/p-d3.webp'], cta: 'Gelişim Paketi', url: L('/products/gelisim-paketi', 'oyuncak') },
        { key: 'ajanda', x: .2, y: .885, label: 'Kırmızı ajanda', title: 'Kasım notu: %10', text: 'Yeni üyelere ilk alışverişte indirim.', coupon: true, cta: 'Alışverişe başla', url: L('/collections/en-cok-satanlar', 'ajanda') },
      ],
      // Gölgen ne diyor? — şehir koordinatları (brief'teki öncelikli şehirler), sorular, ürünler
      gunes: {
        cities: [
          { key: 'istanbul', name: 'İstanbul', lat: 41.01, lon: 28.98 }, { key: 'ankara', name: 'Ankara', lat: 39.93, lon: 32.86 },
          { key: 'izmir', name: 'İzmir', lat: 38.42, lon: 27.14 }, { key: 'bursa', name: 'Bursa', lat: 40.19, lon: 29.06 },
          { key: 'antalya', name: 'Antalya', lat: 36.9, lon: 30.7 }, { key: 'adana', name: 'Adana', lat: 37.0, lon: 35.32 },
          { key: 'konya', name: 'Konya', lat: 37.87, lon: 32.48 },
        ],
        fact: 'Gölgen boyundan uzunsa güneş, cildin D vitamini üretebileceği kadar dik gelmez.',
        questions: [
          { key: 'gun', q: 'Günün çoğu nasıl geçiyor?', a: [{ v: 'masa', t: 'Masa başında', img: 'img/q-masa.webp' }, { v: 'hareket', t: 'Hareket halinde', img: 'img/q-hareket.webp' }] },
          { key: 'aile', q: 'Rutini kimin için kuruyorsun?', a: [{ v: 'cocuk', t: 'Minikler de var', img: 'img/q-aile.webp' }, { v: 'ben', t: 'Kendim için', img: 'img/q-ben.webp' }] },
          { key: 'his', q: "Kasım'da en çok neye ihtiyacın var?", a: [{ v: 'enerji', t: 'Gün boyu enerji', img: 'img/q-enerji.webp' }, { v: 'huzur', t: 'Akşam dinginliği', img: 'img/q-huzur.webp' }] },
        ],
        products: {
          d3k2: { key: 'd3k2', name: 'Vitamin D3 & K2 Damla', why: 'Gün ışığı azaldığında', claim: 'D vitamini bağışıklık sisteminin normal fonksiyonuna katkıda bulunur.', img: 'img/p-d3k2.webp', url: L('/products/d3-k2-vitamin-damlasi', 'gunes_d3k2') },
          d3: { key: 'd3', name: 'Vitamin D3 Damla', why: 'Minikler için gün ışığı desteği', claim: 'D vitamini çocuklarda kemiklerin normal büyüme ve gelişimi için gereklidir.', img: 'img/p-d3.webp', url: L('/products/vitamin-d3-damla', 'gunes_d3') },
          omega3surup: { key: 'omega3surup', name: 'Omega 3 Şurup', why: 'Minikler için, yeni tadıyla', claim: '4 yaş ve üzeri çocuklar için sıvı form.', img: 'img/p-omega3surup.webp', url: L('/products/omega-3-surup', 'gunes_omega3surup') },
          b12: { key: 'b12', name: 'Vitamin B12 & Folik Asit', why: 'Gün boyu enerji için', claim: 'B12 vitamini yorgunluk ve bitkinliğin azalmasına katkıda bulunur.', img: 'img/p-b12.webp', url: L('/products/vitamin-b12-metilfolat', 'gunes_b12') },
          magnezyum: { key: 'magnezyum', name: 'Magnezyum', why: 'Akşam rutini için', claim: 'Magnezyum sinir sisteminin normal fonksiyonuna katkıda bulunur.', img: 'img/p-magnezyum.webp', url: L('/products/magnezyum', 'gunes_magnezyum') },
          omega3: { key: 'omega3', name: 'Omega 3', why: 'Masa başı günler için', claim: 'EPA ve DHA kalbin normal fonksiyonuna katkıda bulunur.', img: 'img/p-omega3.webp', url: L('/products/omega-3-33-22-60-kapsul', 'gunes_omega3') },
          krill: { key: 'krill', name: 'Krill Yağı', why: 'Hareketli günler için', claim: 'EPA ve DHA kalbin normal fonksiyonuna katkıda bulunur.', img: 'img/p-krill.webp', url: L('/products/krill-yagi', 'gunes_krill') },
        },
        // utm_content en sonda; kreatif cevapları sonuna ekler (…_test_masa_cocuk_enerji) → markaya ihtiyaç dağılımı verisi
        resultUrl: L('/collections/gida-takviyeleri', 'test'),
        note: 'Bu test tıbbi tavsiye değildir; takviye kullanımı için hekiminize danışın.',
      },
      // An ↔ ürün eşleri
      memory: [
        { key: 'enerji', img: 'img/m-enerji.webp', pack: 'img/p-b12.webp', name: 'B12 & Folik Asit', url: L('/products/vitamin-b12-metilfolat', 'enerji') },
        { key: 'hareket', img: 'img/m-aktif.webp', pack: 'img/p-krill.webp', name: 'Krill Yağı', url: L('/products/krill-yagi', 'hareket') },
        { key: 'cocuk', img: 'img/m-cocuk.webp', pack: 'img/p-omega3surup.webp', name: 'Omega 3 Şurup', url: L('/products/omega-3-surup', 'cocuk') },
      ],
    };
  },
};
