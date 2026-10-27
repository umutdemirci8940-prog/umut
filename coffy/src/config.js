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
    // coffy.com.tr'deki resmi vektör logo; derleme sırasında satır içi SVG olarak gömülür (renk: currentColor).
    logo: 'assets/coffy-logo.svg',
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
    // Google Haritalar'da "Coffy" araması: kullanıcının konumuna göre en yakın şubeleri listeler.
    directions: 'https://www.google.com/maps/search/?api=1&query=Coffy',
  },

  // Konum: sırasıyla MRAID getLocation → ad server makroları → ?lat=&lon= parametresi → fallback.
  // DV360/CM360 makroları yükleme sırasında ad server tarafından doldurulur.
  geo: {
    latMacro: '${LAT}',
    lonMacro: '${LONG}',
    fallback: { lat: 40.9862, lng: 29.0336, area: 'Kadıköy' },
    walkMetersPerMin: 80,
  },

  // Şubeler: coffy.com.tr/subeler sayfasındaki gerçek liste (ad, enlem, boylam, ilçe/il).
  // Derleme sırasında assets/stores.json'dan yüklenir.
  storesFile: 'assets/stores.json',

  // Ürünler: coffy.com.tr/menu görselleri, arka planı silinmiş (assets/products). Banner boyutu için 6 ürün gömülür.
  productKeys: ['iced-latte', 'latte', 'iced-americano', 'cold-brew', 'pumpkin-latte', 'strawberry-lemonade'],
  hero: 'iced-latte',
  ring: ['iced-latte', 'pumpkin-latte', 'cold-brew', 'strawberry-lemonade', 'latte', 'iced-americano'],
  // Video yer tutucusunda kullanılan gerçek Coffy bardağı fotoğrafı (coffy.com.tr ana sayfa)
  photoFile: 'assets/photos/eller.webp',

  // Ruh hali önerileri (07): menüdeki gerçek ürünler
  drinks: {
    sleepy: 'iced-americano',
    stressed: 'iced-latte',
    social: 'strawberry-lemonade',
    focus: 'cold-brew',
  },
};
