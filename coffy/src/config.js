'use strict';
/**
 * "Çok da Coffy" – 10 bannerın ortak ayarları.
 * Metinler, video, teklif, çıkış adresleri ve şube verisi tek yerden yönetilir.
 * Değiştirdikten sonra:  node coffy/build.js
 */
module.exports = {
  brand: {
    name: 'Coffy',
    slogan: 'Çok da Coffy',
    // Resmi logo SVG'si gelince buraya yapıştırın (tek renk, currentColor kullanan SVG önerilir).
    // Boş bırakılırsa bannerlar "coffy" yazı logosunu kullanır.
    logoSvg: '',
    // Markanın logosu (beyaz, şeffaf zemin). Derleme sırasında dosyaya gömülür.
    logo: 'assets/logo-white.png',
    hashtag: '#ÇokDaCoffy',
  },

  // Ana kampanya videosu. src boşsa bannerlar animasyonlu bir video yer tutucusu gösterir.
  // Örn: src: 'https://cdn.example.com/cok-da-coffy-6s.mp4', poster: 'https://.../poster.jpg'
  // (Video bannerın kendi dosya boyutuna sayılmaz; ağın "polite load" / harici CDN kuralına göre barındırın.)
  video: {
    src: '',
    poster: '',
    maxSec: 6,        // bannerda video aşaması en fazla bu kadar sürer, sonra interaksiyon başlar
    skipAfterSec: 2,  // "Geç" düğmesi bu saniyeden sonra çıkar
    placeholderSec: 5,
  },

  // Teklif – yer tutucudur, gerçek kampanya mekaniğiyle değiştirilecek.
  offer: {
    code: 'COKDACOFFY',
    text: 'Uygulamada ilk siparişine sürpriz',
    note: 'Kod örnektir; kampanya mekaniğine göre güncellenecek.',
  },

  // Çıkışlar. clickTag tanımlıysa (Google Ads / CM360) her çıkış clickTag'e gider;
  // Studio'da Enabler.exit(<ad>) çağrılır, uygulama içinde (MRAID) mraid.open kullanılır.
  exits: {
    app: 'https://www.coffy.com.tr/',
    stores: 'https://www.coffy.com.tr/',
    directions: 'https://www.google.com/maps/dir/?api=1&destination={lat},{lng}',
  },

  // Konum: sırasıyla MRAID getLocation → ad server makroları → ?lat=&lon= parametresi → fallback.
  // DV360/CM360 makroları yükleme sırasında ad server tarafından doldurulur.
  geo: {
    latMacro: '${LAT}',
    lonMacro: '${LONG}',
    fallback: { lat: 40.9862, lng: 29.0336, area: 'Kadıköy' },
    walkMetersPerMin: 80,
  },

  // ÖRNEK şube verisi – gerçek Coffy şube feed'i (ad, koordinat, saat) ile değiştirilecek.
  // sample: true iken bannerlarda küçük "örnek veri" etiketi görünür.
  storesSample: true,
  stores: [
    { name: 'Coffy Kadıköy', area: 'Kadıköy', lat: 40.9906, lng: 29.0274, hours: '07:30–23:00' },
    { name: 'Coffy Moda', area: 'Kadıköy', lat: 40.9840, lng: 29.0262, hours: '08:00–00:00' },
    { name: 'Coffy Üsküdar', area: 'Üsküdar', lat: 41.0256, lng: 29.0157, hours: '07:30–23:00' },
    { name: 'Coffy Beşiktaş', area: 'Beşiktaş', lat: 41.0428, lng: 29.0075, hours: '07:00–00:00' },
    { name: 'Coffy Mecidiyeköy', area: 'Şişli', lat: 41.0672, lng: 28.9937, hours: '07:30–22:30' },
    { name: 'Coffy Bakırköy', area: 'Bakırköy', lat: 40.9805, lng: 28.8722, hours: '08:00–23:00' },
    { name: 'Coffy Kızılay', area: 'Çankaya', lat: 39.9208, lng: 32.8541, hours: '07:30–23:00' },
    { name: 'Coffy Alsancak', area: 'Konak', lat: 38.4374, lng: 27.1432, hours: '08:00–00:00' },
  ],

  // Menü önerileri (Ruh Hali konsepti). İçecek adları örnektir; güncel menüyle eşleştirilecek.
  drinks: {
    sleepy: { name: 'Double Shot Americano', tone: '#3a1f12' },
    stressed: { name: 'Iced Latte', tone: '#b98a5e' },
    social: { name: 'Caramel Frappé', tone: '#d39a52' },
    focus: { name: 'Flat White', tone: '#8a5a36' },
  },
};
