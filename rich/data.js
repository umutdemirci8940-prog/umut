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
        { key: 'vitc', name: 'Vitamin C', da: 'de', path: '/products/vitamin-c' },
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
      // Rutin Eşleş: takviyeler tanışma uygulaması profili olarak (yalnızca yetişkin ürünleri)
      eslesme: [
        { key: 'magnezyum', name: 'Magnezyum', age: '60', unit: 'kapsül', photo: 'img/dt-magnezyum.webp', pack: 'img/p-magnezyum.webp', bio: 'Akşam sakinliğini, hafta sonu yürüyüşlerini ve düzenli rutinleri severim.', claim: 'Yorgunluk ve bitkinliğin azalmasına katkıda bulunurum.', tags: ['akşam rutini', 'kas fonksiyonu', 'bitkisel kapsül'], url: L('/products/magnezyum', 'magnezyum') },
        { key: 'd3k2', name: 'D3 & K2', da: 'de', age: '400', unit: 'damla', photo: 'img/dt-d3k2.webp', pack: 'img/p-d3k2.webp', bio: 'Güneşin alçaldığı Kasım günlerinde yanındayım. Zeytinyağı bazlıyım.', claim: 'D vitamini bağışıklık sisteminin normal fonksiyonuna katkıda bulunur.', tags: ['güneşsiz günler', 'damla', 'zeytinyağı'], url: L('/products/d3-k2-vitamin-damlasi', 'd3k2') },
        { key: 'b12', name: 'B12 & Folik Asit', da: 'de', age: '30', unit: 'tablet', photo: 'img/dt-b12.webp', pack: 'img/p-b12.webp', bio: 'Pazartesi sabahlarının en sevilen yüzü. Çiğnenebilirim.', claim: 'B12 vitamini yorgunluk ve bitkinliğin azalmasına katkıda bulunur.', tags: ['enerji', 'çiğneme tableti', 'metil form'], url: L('/products/vitamin-b12-metilfolat', 'b12') },
        { key: 'krill', name: 'Krill Yağı', age: '60', unit: 'kapsül', photo: 'img/dt-krill.webp', pack: 'img/p-krill.webp', bio: 'Pilates sonrası buluşalım. Kırmızı rengim astaksantinden.', claim: 'EPA ve DHA kalbin normal fonksiyonuna katkıda bulunur.', tags: ['pilates', 'hareket', 'omega 3'], url: L('/products/krill-yagi', 'krill') },
        { key: 'vitc', name: 'Vitamin C', age: '30', unit: 'kapsül', photo: 'img/dt-vitc.webp', pack: 'img/p-vitc.webp', bio: 'Kışa hazırlık konusunda ciddiyim. Portakal kokulu sabahlar.', claim: 'C vitamini bağışıklık sisteminin normal fonksiyonuna katkıda bulunur.', tags: ['kışa hazırlık', 'turunçgil', 'vegan kapsül'], url: L('/products/vitamin-c', 'vitc') },
        { key: 'omega3', name: 'Omega 3', da: 'de', age: '60', unit: 'kapsül', photo: 'img/dt-omega3.webp', pack: 'img/p-omega3.webp', bio: 'Masa başı günlerin sessiz kahramanı. Kokusuzum, söz.', claim: 'EPA ve DHA kalbin normal fonksiyonuna katkıda bulunur.', tags: ['masa başı', 'balık yağı', '33/22'], url: L('/products/omega-3-33-22-60-kapsul', 'omega3') },
        { key: 'cinko', name: 'Çinko', age: '30', unit: 'kapsül', photo: 'img/dt-cinko.webp', pack: 'img/p-cinko.webp', bio: 'Avokado, somon ve brokoliyle aram çok iyi.', claim: 'Çinko bağışıklık sisteminin normal fonksiyonuna katkıda bulunur.', tags: ['bağışıklık', 'saç & tırnak', 'mutfak'], url: L('/products/cinko', 'cinko') },
      ],
      // Kasım Kazı Kazan: 6 pencere, 3'ü aynı (herkes kazanır — çekiliş değildir)
      kazi: {
        win: { key: 'd3k2', name: 'Vitamin D3 & K2', img: 'img/p-d3k2.webp', url: L('/products/d3-k2-vitamin-damlasi', 'kazi_d3k2') },
        others: [{ key: 'b12', img: 'img/p-b12.webp' }, { key: 'magnezyum', img: 'img/p-magnezyum.webp' }, { key: 'vitc', img: 'img/p-vitc.webp' }],
        url: L('/collections/en-cok-satanlar', 'kazi_kupon'),
        rule: '3 aynı ürünü bul, Kasım hediyeni kazan.',
        fine: 'Çekiliş değildir; her kart kazanır ve tüm katılımcılar aynı indirimi alır.',
      },
      // Bulutları Dağıt: 20 sn mini oyun
      oyun: {
        clouds: ['img/s-bulut1.webp', 'img/s-bulut2.webp', 'img/s-bulut3.webp'],
        foods: [
          { img: 'img/s-portakal.webp', t: 'Portakal · C vitamini' }, { img: 'img/s-somon.webp', t: 'Somon · Omega 3' },
          { img: 'img/s-brokoli.webp', t: 'Brokoli · K vitamini' }, { img: 'img/s-bal.webp', t: 'Bal peteği' },
          { img: 'img/s-zeytin.webp', t: 'Zeytin' }, { img: 'img/s-avokado.webp', t: 'Avokado' }, { img: 'img/s-domates.webp', t: 'Domates' },
        ],
        picks: [
          { key: 'd3k2', name: 'Vitamin D3 & K2 Damla', img: 'img/p-d3k2.webp', url: L('/products/d3-k2-vitamin-damlasi', 'oyun_d3k2') },
          { key: 'vitc', name: 'Vitamin C', img: 'img/p-vitc.webp', url: L('/products/vitamin-c', 'oyun_vitc') },
          { key: 'omega3', name: 'Omega 3', img: 'img/p-omega3.webp', url: L('/products/omega-3-33-22-60-kapsul', 'oyun_omega3') },
        ],
        url: L('/collections/gida-takviyeleri', 'oyun_sonuc'),
      },
      // Kasım Takvimi: her gün bir kapı (gün, etiket, başlık, metin, onaylı beyan, CTA, görsel, adres)
      takvim: {
        year: 2026,
        days: [
          { d: 1, over: 'Başlangıç', title: '30 gün, 30 kapı', text: 'Kasım boyunca her gün yeni bir kapı açılıyor: ürünler, kitaplar, tarifler ve fırsatlar.', claim: '', cta: 'Takvimi keşfet', img: 'img/tk-01.webp', thumb: 'img/tk-01-s.webp', url: L('/collections/gida-takviyeleri', 'gun01') },
          { d: 2, over: 'Ürün günü', title: 'Pazartesi enerjisi', text: 'Haftaya çiğnenebilir bir tabletle başla: Vitamin B12 & Folik Asit.', claim: 'B12 vitamini yorgunluk ve bitkinliğin azalmasına katkıda bulunur.', cta: 'Ürünü incele', img: 'img/tk-02.webp', thumb: 'img/tk-02-s.webp', url: L('/products/vitamin-b12-metilfolat', 'gun02') },
          { d: 3, over: 'Çay saati', title: 'İlk soğuklar, ilk fincan', text: 'Pencerede kar, elinde Kış Çayı. Piramit poşette, kafeinsiz.', claim: '', cta: 'Kış Çayı', img: 'img/tk-03.webp', thumb: 'img/tk-03-s.webp', url: L('/products/kis-cayi', 'gun03') },
          { d: 4, over: 'Ürün günü', title: 'Güneş alçaldı', text: 'Kasım\'da öğle güneşi yaz ayına göre çok daha alçak. Rutinine gün ışığı desteği.', claim: 'D vitamini bağışıklık sisteminin normal fonksiyonuna katkıda bulunur.', cta: 'D3 & K2 Damla', img: 'img/tk-04.webp', thumb: 'img/tk-04-s.webp', url: L('/products/d3-k2-vitamin-damlasi', 'gun04') },
          { d: 5, over: 'Blog', title: 'Okul çantasına ne koysak?', text: 'Çocukların bağışıklık sistemini destekleyen besinler: blogda okuma listesi.', claim: '', cta: 'Yazıyı oku', img: 'img/tk-05.webp', thumb: 'img/tk-05-s.webp', url: L('/blogs/tum-bloglar/cocuklarin-bagisiklik-sistemini-destekleyen-besinler-nelerdir', 'gun05') },
          { d: 6, over: 'Hafta sonu', title: 'Cuma\'dan Pazar\'a fırsatlar', text: 'Hafta sonu fırsatları başladı. Sepetini hazırla, matcha latteni al.', claim: '', cta: 'Fırsatları gör', img: 'img/tk-06.webp', thumb: 'img/tk-06-s.webp', url: L('/pages/kampanyalar', 'gun06') },
          { d: 7, over: 'Ürün günü', title: 'Pilates sonrası', text: 'Hareketin kırmızı kapsülü: Krill Yağı.', claim: 'EPA ve DHA kalbin normal fonksiyonuna katkıda bulunur.', cta: 'Krill Yağı', img: 'img/tk-07.webp', thumb: 'img/tk-07-s.webp', url: L('/products/krill-yagi', 'gun07') },
          { d: 8, over: 'Kitap günü', title: 'Pazar okuması', text: 'Dr. Ümit Aktaş\'ın çok okunan kitabı "İlaçsız Yaşam".', claim: '', cta: 'Kitabı incele', img: 'img/tk-08.webp', thumb: 'img/tk-08-s.webp', url: L('/products/ilacsiz-yasam', 'gun08') },
          { d: 9, over: 'Ürün günü', title: 'Masa başı pazartesi', text: 'Omega 3 33/22: kokusuz, 60 kapsül.', claim: 'EPA ve DHA kalbin normal fonksiyonuna katkıda bulunur.', cta: 'Omega 3', img: 'img/tk-09.webp', thumb: 'img/tk-09-s.webp', url: L('/products/omega-3-33-22-60-kapsul', 'gun09') },
          { d: 10, over: 'Ritüel', title: 'Sabahın yeşil ritüeli', text: '%100 Japon matcha ile güne yavaş başla.', claim: '', cta: 'Matcha', img: 'img/tk-10.webp', thumb: 'img/tk-10-s.webp', url: L('/products/matcha', 'gun10') },
          { d: 11, over: '11.11', title: '11.11 kapısı', text: 'Yılın en büyük alışveriş gününde yeni üyelere ilk alışverişte %10.', claim: '', cta: 'Alışverişe başla', img: 'img/tk-11.webp', thumb: 'img/tk-11-s.webp', url: L('/collections/en-cok-satanlar', 'gun11') },
          { d: 12, over: 'Ürün günü', title: 'Kökten gelen sıcaklık', text: 'Topraktan gelen zencefil, kapsülde: Zencefil Ekstraktı.', claim: '', cta: 'Zencefil', img: 'img/tk-12.webp', thumb: 'img/tk-12-s.webp', url: L('/products/zencefil-ekstrakti-zingiber-officinale', 'gun12') },
          { d: 13, over: 'Hafta sonu', title: 'Turuncu hafta sonu', text: 'Hafta sonu fırsatları ve kışa hazırlık: Vitamin C.', claim: 'C vitamini bağışıklık sisteminin normal fonksiyonuna katkıda bulunur.', cta: 'Fırsatları gör', img: 'img/tk-13.webp', thumb: 'img/tk-13-s.webp', url: L('/pages/kampanyalar', 'gun13') },
          { d: 14, over: 'Ürün günü', title: 'Ormandan yeşil', text: '120 kapsül Spirulina, doğadan.', claim: '', cta: 'Spirulina', img: 'img/tk-14.webp', thumb: 'img/tk-14-s.webp', url: L('/products/spirulina', 'gun14') },
          { d: 15, over: 'Blog', title: 'Reishi nedir?', text: 'Ormanın kırmızı mantarı hakkında bilmen gerekenler blogda.', claim: '', cta: 'Yazıyı oku', img: 'img/tk-15.webp', thumb: 'img/tk-15-s.webp', url: L('/blogs/tum-bloglar', 'gun15') },
          { d: 16, over: 'Ürün günü', title: 'Mutfaktaki çinko', text: 'Avokado, somon, kabak çekirdeği… ve Çinko kapsül.', claim: 'Çinko bağışıklık sisteminin normal fonksiyonuna katkıda bulunur.', cta: 'Çinko', img: 'img/tk-16.webp', thumb: 'img/tk-16-s.webp', url: L('/products/cinko', 'gun16') },
          { d: 17, over: 'Aile günü', title: 'Miniklere yeni tat', text: 'Omega 3 Şurup: 4 yaş ve üzeri, yeni tadıyla.', claim: '', cta: 'Omega 3 Şurup', img: 'img/tk-17.webp', thumb: 'img/tk-17-s.webp', url: L('/products/omega-3-surup', 'gun17') },
          { d: 18, over: 'Ürün günü', title: 'Mor çiçeğin kırmızısı', text: 'Safran Ekstresi, patentli safran ile.', claim: '', cta: 'Safran Ekstresi', img: 'img/tk-18.webp', thumb: 'img/tk-18-s.webp', url: L('/products/safran-ekstresi', 'gun18') },
          { d: 19, over: 'Çay saati', title: 'Ihlamur kokusu', text: 'Çiçek Ihlamur: demle, kokla, yavaşla.', claim: '', cta: 'Çiçek Ihlamur', img: 'img/tk-19.webp', thumb: 'img/tk-19-s.webp', url: L('/products/cicek-ihlamur', 'gun19') },
          { d: 20, over: 'Hafta sonu', title: 'Renkli tabak', text: 'Hafta sonu fırsatları ve blogdan: demirin emilimini etkileyen besinler.', claim: '', cta: 'Fırsatları gör', img: 'img/tk-20.webp', thumb: 'img/tk-20-s.webp', url: L('/pages/kampanyalar', 'gun20') },
          { d: 21, over: 'Kitap günü', title: 'Mutluluk Kürleri', text: 'Dr. Ümit Aktaş\'tan 21 günlük mutluluk programı.', claim: '', cta: 'Kitabı incele', img: 'img/tk-21.webp', thumb: 'img/tk-21-s.webp', url: L('/products/mutluluk-kurleri', 'gun21') },
          { d: 22, over: 'Sofra', title: 'Erken hasat pazarı', text: 'Erken hasat, soğuk sıkım, 0,2 asit: Sızma Zeytinyağı.', claim: '', cta: 'Zeytinyağı', img: 'img/tk-22.webp', thumb: 'img/tk-22-s.webp', url: L('/products/erken-hasat-sizma-zeytinyagi-500-ml-yarim-litre', 'gun22') },
          { d: 23, over: 'Çay saati', title: 'Ay ışığında bir fincan', text: 'Uyku Öncesi Çayı ile akşam ritüeli.', claim: '', cta: 'Uyku Öncesi Çayı', img: 'img/tk-23.webp', thumb: 'img/tk-23-s.webp', url: L('/products/uyku-oncesi-cayi', 'gun23') },
          { d: 24, over: 'Ürün günü', title: 'Arının hediyesi', text: 'Propolis: 60 kapsül, bitkisel kökenli kapsülde.', claim: '', cta: 'Propolis', img: 'img/tk-24.webp', thumb: 'img/tk-24-s.webp', url: L('/products/propolis-kapsul', 'gun24') },
          { d: 25, over: 'Aile günü', title: 'Gelişim Paketi', text: 'Vitamin D3 Damla ve Omega 3 Şurup bir arada.', claim: 'D vitamini çocuklarda kemiklerin normal büyüme ve gelişimi için gereklidir.', cta: 'Paketi incele', img: 'img/tk-25.webp', thumb: 'img/tk-25-s.webp', url: L('/products/gelisim-paketi', 'gun25') },
          { d: 26, over: 'Blog', title: 'Antioksidan sofrası', text: 'Antioksidan içeren besin ve içecekler: blogda okuma listesi.', claim: '', cta: 'Yazıyı oku', img: 'img/tk-26.webp', thumb: 'img/tk-26-s.webp', url: L('/blogs/tum-bloglar', 'gun26') },
          { d: 27, over: 'Hafta sonu', title: 'Kasım\'ın son hafta sonu', text: 'Kasım\'ın son fırsatları sitede.', claim: '', cta: 'Fırsatları gör', img: 'img/tk-27.webp', thumb: 'img/tk-27-s.webp', url: L('/pages/kampanyalar', 'gun27') },
          { d: 28, over: 'Ürün günü', title: 'Akşam rutini', text: 'Magnezyum ile akşamlarına sakin bir ritim.', claim: 'Magnezyum sinir sisteminin normal fonksiyonuna katkıda bulunur.', cta: 'Magnezyum', img: 'img/tk-28.webp', thumb: 'img/tk-28-s.webp', url: L('/products/magnezyum', 'gun28') },
          { d: 29, over: 'Sofra', title: 'Temiz baharat', text: 'GDO, gluten ve ağır metal analizli, helal sertifikalı baharatlar.', claim: '', cta: 'Baharatlar', img: 'img/tk-29.webp', thumb: 'img/tk-29-s.webp', url: L('/collections/baharatlar', 'gun29') },
          { d: 30, over: 'Final', title: 'Kasım bitti, rutin sürsün', text: '30 kapının hepsi açıldı. Rutinin Aralık\'ta da seninle.', claim: '', cta: 'Rutinini kur', img: 'img/tk-30.webp', thumb: 'img/tk-30-s.webp', url: L('/collections/gida-takviyeleri', 'gun30') },
        ],
      },
      // Mesajlaşma reklamı: hazır sorular → onaylı cevaplar (kullanım bilgisi ürün kutusundaki "Nasıl kullanılır" görsellerinden)
      sohbet: {
        hello: ['Merhaba! Kasım geldi, günler kısaldı.', 'Rutinini birlikte kuralım mı? Aşağıdan bir soru seç.'],
        teaser: { img: 'img/tk-03.webp', text: 'Bu akşam için küçük bir öneri: karlı bir pencere önünde Kış Çayı.' },
        note: 'Kullanım bilgisi ürün ambalajındandır. Takviye kullanımı için hekiminize danışın.',
        qs: [
          { key: 'magnezyum_ne_zaman', q: 'Magnezyum ne zaman alınır?', a: ['Ambalajında iki seçenek var: sabah kahvaltıdan sonra ya da akşam yemekten sonra, tok karnına 1 kapsül.'], cards: ['magnezyum'] },
          { key: 'sabah_enerji', q: 'Sabahları enerjim düşük', a: ['Kasım sabahları zor, biliyoruz.', 'Güne çiğnenebilir bir B12 tabletiyle başlamak isteyebilirsin.'], cards: ['b12'] },
          { key: 'aksam', q: 'Akşamları dinlenemiyorum', a: ['Akşam ritüeli için iki öneri:'], cards: ['magnezyum', 'uyku'] },
          { key: 'cocuk', q: 'Çocuğum için ne var?', a: ['Miniklerin iki favorisi:'], cards: ['omega3surup', 'd3'] },
          { key: 'spor', q: 'Düzenli spor yapıyorum', a: ['Hareketli günlerin kırmızı kapsülü:'], cards: ['krill'] },
          { key: 'gunes', q: 'Güneş yok, ne yapayım?', a: ['Kasım\'da öğle güneşi alçak: gölgen boyundan uzun.', 'Gün ışığı azaldığında D3 & K2 Damla:'], cards: ['d3k2'] },
        ],
        cards: {
          magnezyum: { name: 'Magnezyum', img: 'img/tk-28.webp', claim: 'Magnezyum sinir sisteminin normal fonksiyonuna katkıda bulunur.', use: 'Sabah ya da akşam, yemekten sonra tok karnına 1 kapsül', url: L('/products/magnezyum', 'magnezyum') },
          b12: { name: 'Vitamin B12 & Folik Asit', img: 'img/tk-02.webp', claim: 'B12 vitamini yorgunluk ve bitkinliğin azalmasına katkıda bulunur.', use: 'Sabah kahvaltıdan sonra 1 tablet', url: L('/products/vitamin-b12-metilfolat', 'b12') },
          uyku: { name: 'Uyku Öncesi Çayı', img: 'img/tk-23.webp', claim: 'Kafeinsiz, piramit poşet bitki çayı.', use: '200 ml sıcak suda 5 dakika demle', url: L('/products/uyku-oncesi-cayi', 'uyku') },
          omega3surup: { name: 'Omega 3 Şurup', img: 'img/tk-17.webp', claim: 'Yeni tadıyla, sıvı form.', use: '4 yaş ve üzeri: sabah kahvaltıdan sonra 5 cc', url: L('/products/omega-3-surup', 'omega3surup') },
          d3: { name: 'Vitamin D3 Damla', img: 'img/p-d3.webp', pack: true, claim: 'D vitamini çocuklarda kemiklerin normal büyüme ve gelişimi için gereklidir.', use: '4–10 yaş: günde 1 damla', url: L('/products/vitamin-d3-damla', 'd3') },
          krill: { name: 'Krill Yağı', img: 'img/tk-07.webp', claim: 'EPA ve DHA kalbin normal fonksiyonuna katkıda bulunur.', use: 'Sabah ya da akşam, yemekten sonra 1 kapsül', url: L('/products/krill-yagi', 'krill') },
          d3k2: { name: 'Vitamin D3 & K2 Damla', img: 'img/tk-04.webp', claim: 'D vitamini bağışıklık sisteminin normal fonksiyonuna katkıda bulunur.', use: 'Sabah kahvaltıdan sonra 1 damla', url: L('/products/d3-k2-vitamin-damlasi', 'd3k2') },
        },
        url: L('/collections/gida-takviyeleri', 'sohbet_genel'),
      },
      // Sevdiğine bir rutin gönder: alıcı → kart fotoğrafı, ürünler, mesaj şablonları; WhatsApp ile paylaşım
      gonder: {
        to: [
          { key: 'anne', label: 'Anneme', who: 'Annem', img: 'img/tk-19.webp', items: ['Kış Çayı', 'Vitamin D3 & K2 Damla'], card: 'img/tk-03.webp' },
          { key: 'baba', label: 'Babama', who: 'Babam', img: 'img/tk-22.webp', items: ['Omega 3', 'Erken Hasat Zeytinyağı'], card: 'img/tk-22.webp' },
          { key: 'es', label: 'Eşime', who: 'Canım', img: 'img/tk-23.webp', items: ['Magnezyum', 'Uyku Öncesi Çayı'], card: 'img/tk-23.webp' },
          { key: 'cocuk', label: 'Çocuğuma', who: 'Minik kuşum', img: 'img/tk-17.webp', items: ['Omega 3 Şurup', 'Vitamin D3 Damla'], card: 'img/tk-17.webp' },
          { key: 'kendim', label: 'Kendime', who: 'Kendime not', img: 'img/tk-10.webp', items: ['Vitamin B12', 'Matcha'], card: 'img/tk-10.webp' },
        ],
        msgs: ['Kasım\'da kendine iyi bak. Senin için bir rutin seçtim:', 'Günler kısaldı ama aklım hep sende. Bu Kasım rutinin benden:', 'Sıcak bir fincan, küçük bir hatırlatma. Kasım rutinin:'],
        landing: L('/collections/gida-takviyeleri', 'gonder_alici'),
        url: L('/collections/gida-takviyeleri', 'gonder_gonderen'),
      },
      // Saati bilen masthead: günün dilimine göre sahne (yerel saat; ?saat=8 ile önizleme)
      gunsaat: {
        city: { name: 'İstanbul', lat: 41.01, lon: 28.98 },
        slots: [
          { key: 'sabah', from: 6, label: 'Sabah', img: 'img/tk-10.webp', title: 'Güne yeşil bir başlangıç.', text: 'Kahvaltıdan sonra B12, yanına bir kase matcha.', product: 'Vitamin B12 & Folik Asit', claim: 'B12 vitamini yorgunluk ve bitkinliğin azalmasına katkıda bulunur.', url: L('/products/vitamin-b12-metilfolat', 'saat_sabah') },
          { key: 'ogle', from: 11, label: 'Öğle', img: 'img/tk-04.webp', title: 'Güneş en tepede, ama alçak.', text: 'Kasım\'da öğle güneşi bile yazın yarısı kadar yüksek. Gün ışığı desteği: D3 & K2.', product: 'Vitamin D3 & K2 Damla', claim: 'D vitamini bağışıklık sisteminin normal fonksiyonuna katkıda bulunur.', url: L('/products/d3-k2-vitamin-damlasi', 'saat_ogle') },
          { key: 'aksam', from: 16, label: 'Akşamüstü', img: 'img/tk-03.webp', title: 'Hava erken karardı.', text: 'Eve dönüş yolunda aklında sıcak bir fincan Kış Çayı olsun.', product: 'Kış Çayı', claim: 'Kafeinsiz, piramit poşet bitki çayı.', url: L('/products/kis-cayi', 'saat_aksam') },
          { key: 'gece', from: 20, label: 'Gece', img: 'img/tk-23.webp', title: 'Ekranı kapatma vakti.', text: 'Uyku Öncesi Çayı ve akşam yemeğinden sonra Magnezyum.', product: 'Magnezyum', claim: 'Magnezyum sinir sisteminin normal fonksiyonuna katkıda bulunur.', url: L('/products/magnezyum', 'saat_gece') },
        ],
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
