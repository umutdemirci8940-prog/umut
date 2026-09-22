'use strict';
/**
 * Pandora Moments 970×250 masthead – tüm metin, ürün, fiyat ve süre ayarları tek yerde.
 *
 * Ürün adları, kodları ve fiyatlar tr.pandora.net'ten alınmıştır (Eylül 2026). Toplayıcı
 * (tools/fetch-assets.js) çalıştığında assets/manifest.json içindeki güncel ad/fiyat/görsel
 * bu değerlerin yerine geçer; buradakiler yalnızca yedektir.
 */
module.exports = {
  brand: {
    name: 'Pandora',
    site: 'https://tr.pandora.net',
    // Yeni platform (aynı TL fiyatlar); tr.pandora.net bekleme odasıyla engellerse toplayıcı buradan çeker
    altSite: 'https://www.pandora.net/tr-tr',
    // clickTag tanımlı değilse açılacak sayfa (UTM'li Pandora Moments koleksiyonu)
    url: 'https://tr.pandora.net/tr/koleksiyonlar/pandora-moments/?utm_source=display&utm_medium=masthead&utm_campaign=moments-2027',
    tagline: 'BE LOVE',
    claim: 'El işçiliği · 925 ayar gümüş · 14 ayar altın kaplama',
    // Ürün kartındayken tıklama ilgili ürün sayfasına gitsin mi? (clickTag varsa yine clickTag kullanılır)
    deepLink: true,
  },

  // Sitedeki güncel kampanya (tr.pandora.net ana sayfa, Eylül 2026): "3 Al 2 Öde" – Pandora Club üyelerine özel
  campaign: {
    enabled: true,
    badge: '3 AL 2 ÖDE',
    line: 'Pandora Club’a özel',
    detail: 'Seçili mücevherlerde 3 ürün seç, 1’i hediye',
    url: 'https://tr.pandora.net/tr/3-al-2-ode-firsati/',
  },

  copy: {
    kicker: 'PANDORA MOMENTS',
    headline: 'Kendi hikâyeni\ntasarla.',
    sub: 'Bilekliğini seç, charm’larını ekle, anını taşı.',
    cta: 'Bilekliğini Tasarla',
    ctaBuilt: 'Bu Tasarımı Satın Al',
    metalLabel: 'Metal',
    trayLabel: 'Charm ekle',
    total: 'Toplam',
    slots: 'charm',
    emptyHint: 'Bir charm seçerek başla',
    full: 'Bileklik dolu · bir charm çıkar',
    reset: 'Temizle',
    sound: 'Ses',
    legal: 'Fiyatlar tr.pandora.net’teki güncel liste fiyatlarıdır; kampanya koşulları sitede.',
    priceOnSite: 'Fiyat sitede',
  },

  // Bileklik seçenekleri (metal). Fotoğraf: assets/manifest.json → products[key]
  bracelets: [
    { key: 'silver', label: 'Gümüş', metal: '925 ayar gümüş', sku: '599652C01', skus: ['590702HV', '599652C01'], title: 'Pandora Moments Yılan Zinciri Ayarlanabilir Bileklik', price: 4479,
      url: 'https://tr.pandora.net/tr/bileklikler/zincir-bileklikler/pandora-moments-yilan-zincir-bileklik/599652C01.html',
      alt: ['https://www.pandora.net/tr-tr/products/bracelets/silver/590702hv', 'https://www.pandora.net/tr-tr/products/bracelets/silver/599652c01-2'],
      swatch: ['#ffffff', '#d9dde3', '#8f97a3'], tone: '#c9ced6',
      // kaydırmalı klips sağ üstte → yuvalar sol uç + alt yay
      slots: [{ x: 0.05, y: 0.64, r: -62 }, { x: 0.24, y: 0.93, r: -26 }, { x: 0.42, y: 0.995, r: -6 }, { x: 0.60, y: 0.985, r: 8 }, { x: 0.77, y: 0.90, r: 28 }] },
    { key: 'rose', label: 'Rose', metal: '14 ayar pembe altın kaplama', sku: '580728', title: 'Moments 14 Ayar Pembe Altın Kaplama Bileklik', price: 5449,
      url: 'https://tr.pandora.net/tr/bileklikler/zincir-bileklikler/moments-14-ayar-pembe-altin-kaplama-bileklik/580728.html',
      alt: ['https://www.pandora.net/tr-tr/products/bracelets/580728'], swatch: ['#ffe9e2', '#e9b4a4', '#b9766a'], tone: '#e3b3a4',
      // top klips sol altta (x≈0.31) → yuvalar klipsin sağında
      slots: [{ x: 0.05, y: 0.62, r: -62 }, { x: 0.50, y: 0.995, r: -2 }, { x: 0.655, y: 0.965, r: 14 }, { x: 0.80, y: 0.885, r: 30 }, { x: 0.925, y: 0.72, r: 52 }] },
    { key: 'gold', label: 'Altın', metal: '14 ayar altın kaplama', sku: '568748C00', title: 'Moments 14 Ayar Altın Kaplama Düz Klipsli Bileklik', price: 5609,
      url: 'https://tr.pandora.net/tr/charmlar-ve-bileklikler/bileklikler/zincir-bileklikler/moments-14-ayar-altin-kaplama-duz-klipsli-bileklik/568748C00.html',
      alt: ['https://www.pandora.net/tr-tr/products/bracelets/pandora-shine/568748c00'], swatch: ['#fff3c4', '#e8c35a', '#b8891c'], tone: '#e6c56b',
      slots: [{ x: 0.05, y: 0.62, r: -62 }, { x: 0.50, y: 0.995, r: -2 }, { x: 0.655, y: 0.965, r: 14 }, { x: 0.80, y: 0.885, r: 30 }, { x: 0.925, y: 0.72, r: 52 }] },
  ],

  // Charm tepsisi (sitedeki gerçek ürünler). Fiyat null ise toplayıcıdan gelen fiyat kullanılır.
  charms: [
    { key: 'hearts', short: 'Sonsuz Kalpler', sku: '790800C00', title: 'İç İçe Sonsuz Kalpler Charm', price: 999,
      url: 'https://tr.pandora.net/tr/charmlar-ve-bileklikler/charmlar/charmlar/i%CC%87c-i%CC%87ce-sonsuz-kalpler-charm/790800C00.html' },
    { key: 'murano', short: 'Pembe Murano', sku: '789421C00', title: 'Mat Pembe Murano Cam Charm', price: 2699,
      url: 'https://tr.pandora.net/tr/charmlar-ve-bileklikler/charmlar/charmlar/mat-pembe-murano-cam-charm/789421C00.html' },
    { key: 'galaxy', short: 'Galaksi Murano', sku: '790015C00', title: 'Galaksi Mavisi ve Yıldız Murano Charm', price: 2779,
      url: 'https://tr.pandora.net/tr/charm%E2%80%99lar-ve-bileklikler/charm%E2%80%99lar/charm%E2%80%99lar/galaksi-mavisi-ve-yildiz-murano-charm/790015C00.html' },
    { key: 'butterfly', short: 'Mavi Kelebek', sku: '790761C01', title: 'Mavi Kelebek Işıltılı Charm', price: 3579,
      url: 'https://tr.pandora.net/tr/charmlar-ve-bileklikler/charmlar/charmlar/mavi-kelebek-isiltili-charm/790761C01.html' },
    { key: 'clip', short: 'Pavé Klips', sku: '791817NSBMX', title: 'Mavi Pavé Klips Charm', price: 2699,
      url: 'https://tr.pandora.net/tr/charmlar/klipsler/mavi-pave-klips-charm/791817NSBMX.html' },
    { key: 'bigbutterfly', short: 'Büyük Kelebek', sku: '793747C01', title: 'Büyük Kelebek Charm', price: 4349,
      url: 'https://tr.pandora.net/tr/charmlar-ve-bileklikler/charmlar/charmlar/buyuk-kelebek-charm/793747C01.html' },
    { key: 'star', short: 'Galaksi Yıldız', sku: '792368C01', title: 'Galaksi Yıldız Murano Sallantılı Charm', price: 2359,
      url: 'https://tr.pandora.net/tr/charmlar-ve-bileklikler/charmlar/sallantili-charmlar/galaksi-yildiz-murano-sallantili-charm/792368C01.html' },
  ],

  // Ek adaylar: toplayıcı bunları da çeker (assets/src), arayüz src/data.js'deki listeleri kullanır
  candidates: [
    { key: 'silverclasp', kind: 'bracelet', sku: '590702HV', title: 'Pandora Moments Yılan Zincir Bileklik', price: null,
      url: 'https://tr.pandora.net/tr/bileklikler/zincir-bileklikler/pandora-moments-yilan-zincir-bileklik/590702HV.html', alt: ['https://www.pandora.net/tr-tr/products/bracelets/silver/590702hv'] },
    { key: 'talisman', kind: 'charm', sku: '764806C01', short: 'Güneş ve Ay', title: 'Güneş ve Ay Büyük Boy Madalyon Charm', price: null,
      url: 'https://tr.pandora.net/tr/charmlar/764806C01.html', alt: [] },
    { key: 'firefly', kind: 'charm', sku: '799352C01', short: 'Ateşböceği', title: 'Karanlıkta Parlayan Ateşböceği Sallantılı Charm', price: null,
      url: 'https://tr.pandora.net/tr/charmlar/799352C01.html', alt: [] },
    { key: 'clover', kind: 'charm', sku: '792751C01', short: 'Yonca', title: 'Dört Yapraklı Yonca Sallantılı Charm', price: null,
      url: 'https://tr.pandora.net/tr/charmlar/792751C01.html', alt: [] },
  ],

  // Listeleme sayfaları: toplayıcı buradaki ürün kartlarını (ad, fiyat, görsel) da indirir – ek charm seçenekleri için
  listings: [
    { key: 'tilsim', name: 'Pandora Tılsım Charm’ları', url: 'https://tr.pandora.net/tr/pandora-tilsim-charmlari/' },
    { key: 'moments', name: 'Pandora Moments', url: 'https://tr.pandora.net/tr/koleksiyonlar/pandora-moments/' },
    { key: 'yeni-charmlar', name: 'Yeni charm’lar', url: 'https://tr.pandora.net/tr/yeni/yeni-mucevherler/yeni-charmlar/' },
    { key: 'kampanya', name: '3 Al 2 Öde', url: 'https://tr.pandora.net/tr/3-al-2-ode-firsati/' },
    { key: 'charmlar', name: 'Charm’lar', url: 'https://tr.pandora.net/tr/charmlar/' },
  ],

  altListings: [
    { key: 'charms', name: 'Charm’lar', url: 'https://www.pandora.net/tr-tr/products/charms' },
    { key: 'bracelets', name: 'Bileklikler', url: 'https://www.pandora.net/tr-tr/products/bracelets' },
  ],

  // Marka sayfaları: logo, hero/kampanya görselleri, başlıklar, ekran görüntüleri
  sitePages: ['/', '/tr/koleksiyonlar/pandora-moments/', '/tr/3-al-2-ode-firsati/', '/tr/pandora-tilsim-charmlari/'],
  altSitePages: ['', '/products/charms', '/products/bracelets'],

  // Sol fotoğraf sütunu (px) – model çekimi; metin ve CTA bunun üzerine gelir
  photo: { w: 330 },
  // Orta sahne: bileklik fotoğrafının kutusu (px) ve charm yuvaları (kutuya oranla; r = açı derece).
  // Packshot'lar geniş oval (≈1.9:1); yuvalar alt yayda, klips (sol alt) boş bırakılır.
  stage: {
    left: 342, top: 42, w: 338, h: 140, charmSize: 52,
    slots: [
      { x: 0.05, y: 0.66, r: -62 },
      { x: 0.40, y: 0.985, r: -8 },
      { x: 0.575, y: 0.985, r: 6 },
      { x: 0.745, y: 0.93, r: 22 },
      { x: 0.885, y: 0.81, r: 42 },
    ],
    // Metal üzerinde ara ara parlayan ışıltılar (kutuya oranla; d = gecikme sn)
    glints: [{ x: 0.12, y: 0.22, d: 0 }, { x: 0.9, y: 0.3, d: 2.1 }, { x: 0.62, y: 0.03, d: 3.7 }],
  },
  demoOrder: ['hearts', 'murano', 'butterfly'],

  // Süreler (ms)
  timing: {
    intro: 2600,        // hero açılış
    demoStep: 1500,     // otomatik gösteride charm ekleme aralığı
    demoCharms: 3,      // otomatik gösteride eklenen charm sayısı
    autoStop: 30000,    // animasyonların durduğu sınır (Google Ads / IAB 30 sn)
    idleRest: 9000,     // etkileşim yoksa CTA vurgusu
  },
  maxCharms: 5,
  tracking: { enabled: true },
};
