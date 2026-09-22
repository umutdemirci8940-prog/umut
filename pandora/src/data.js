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
  },

  // Bileklik seçenekleri (metal). Fotoğraf: assets/manifest.json → products[key]
  bracelets: [
    { key: 'silver', label: 'Gümüş', metal: '925 ayar gümüş', sku: '599652C01', skus: ['590702HV', '599652C01'], title: 'Pandora Moments Yılan Zincir Bileklik', price: 5269,
      url: 'https://tr.pandora.net/tr/bileklikler/zincir-bileklikler/pandora-moments-yilan-zincir-bileklik/599652C01.html',
      alt: ['https://www.pandora.net/tr-tr/products/bracelets/silver/590702hv', 'https://www.pandora.net/tr-tr/products/bracelets/silver/599652c01-2'],
      swatch: ['#ffffff', '#d9dde3', '#8f97a3'], tone: '#c9ced6' },
    { key: 'rose', label: 'Rose', metal: '14 ayar pembe altın kaplama', sku: '580728', title: 'Moments 14 Ayar Pembe Altın Kaplama Bileklik', price: 7609,
      url: 'https://tr.pandora.net/tr/bileklikler/zincir-bileklikler/moments-14-ayar-pembe-altin-kaplama-bileklik/580728.html',
      alt: ['https://www.pandora.net/tr-tr/products/bracelets/580728'], swatch: ['#ffe9e2', '#e9b4a4', '#b9766a'], tone: '#e3b3a4' },
    { key: 'gold', label: 'Altın', metal: '14 ayar altın kaplama', sku: '568748C00', title: 'Moments 14 Ayar Altın Kaplama Düz Klipsli Bileklik', price: 6419,
      url: 'https://tr.pandora.net/tr/charmlar-ve-bileklikler/bileklikler/zincir-bileklikler/moments-14-ayar-altin-kaplama-duz-klipsli-bileklik/568748C00.html',
      alt: ['https://www.pandora.net/tr-tr/products/bracelets/pandora-shine/568748c00'], swatch: ['#fff3c4', '#e8c35a', '#b8891c'], tone: '#e6c56b' },
  ],

  // Charm tepsisi (sitedeki gerçek ürünler). Fiyat null ise toplayıcıdan gelen fiyat kullanılır.
  charms: [
    { key: 'hearts', short: 'Sonsuz Kalpler', sku: '790800C00', title: 'İç İçe Sonsuz Kalpler Charm', price: 1599,
      url: 'https://tr.pandora.net/tr/charmlar-ve-bileklikler/charmlar/charmlar/i%CC%87c-i%CC%87ce-sonsuz-kalpler-charm/790800C00.html' },
    { key: 'galaxy', short: 'Galaksi Murano', sku: '790015C00', title: 'Galaksi Mavisi ve Yıldız Murano Charm', price: 2549,
      url: 'https://tr.pandora.net/tr/charm%E2%80%99lar-ve-bileklikler/charm%E2%80%99lar/charm%E2%80%99lar/galaksi-mavisi-ve-yildiz-murano-charm/790015C00.html' },
    { key: 'murano', short: 'Pembe Murano', sku: '789421C00', title: 'Mat Pembe Murano Cam Charm', price: 2009,
      url: 'https://tr.pandora.net/tr/charmlar-ve-bileklikler/charmlar/charmlar/mat-pembe-murano-cam-charm/789421C00.html' },
    { key: 'butterfly', short: 'Mavi Kelebek', sku: '790761C01', title: 'Mavi Kelebek Işıltılı Charm', price: 2359,
      url: 'https://tr.pandora.net/tr/charmlar-ve-bileklikler/charmlar/charmlar/mavi-kelebek-isiltili-charm/790761C01.html' },
    { key: 'star', short: 'Galaksi Yıldız', sku: '792368C01', title: 'Galaksi Yıldız Murano Sallantılı Charm', price: 2359,
      url: 'https://tr.pandora.net/tr/charmlar-ve-bileklikler/charmlar/sallantili-charmlar/galaksi-yildiz-murano-sallantili-charm/792368C01.html' },
    { key: 'clip', short: 'Pavé Klips', sku: '791817NSBMX', title: 'Mavi Pavé Klips Charm', price: 2029,
      url: 'https://tr.pandora.net/tr/charmlar/klipsler/mavi-pave-klips-charm/791817NSBMX.html' },
    { key: 'bigbutterfly', short: 'Büyük Kelebek', sku: '793747C01', title: 'Büyük Kelebek Charm', price: null,
      url: 'https://tr.pandora.net/tr/charmlar-ve-bileklikler/charmlar/charmlar/buyuk-kelebek-charm/793747C01.html' },
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

  // Orta sahne: bileklik fotoğrafının konumu (px) ve charm yuvaları (kutuya oranla; açı derece)
  stage: {
    left: 402, top: -52, size: 280,
    slots: [
      { x: 0.14, y: 0.62, r: -46 },
      { x: 0.29, y: 0.80, r: -24 },
      { x: 0.5, y: 0.85, r: 0 },
      { x: 0.71, y: 0.80, r: 24 },
      { x: 0.86, y: 0.62, r: 46 },
    ],
    charmSize: 56,
  },
  demoOrder: ['hearts', 'murano', 'star'],

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
