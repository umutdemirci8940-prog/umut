'use strict';
/**
 * KFC Türkiye – "Kepenkler yeniden açılıyor" 970x250 interaktif banner
 * Tüm metinler, bağlantılar, süreler ve varlık seçimleri burada.
 * Varlık dosyaları assets/kfc/ altından (GitHub Actions ile siteden toplanır) okunur;
 * `url` alanı ise "linked" modda doğrudan sitedeki adresi kullanır.
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
    kicker: 'TÜRKİYE,',
    headline: 'KFC GERİ DÖNDÜ!',
    stamp: 'YENİDEN AÇILDI',
    sub: 'Şubelerimiz birer birer yeniden açılıyor.',
    cities: ['İstanbul', 'Ankara', 'İzmir'],
    citiesLabel: 'Sana en yakın şube',
    cta: 'En yakın KFC’yi bul',
    replay: 'Tekrar izle',
    aria: 'KFC Türkiye – şubelerimiz yeniden açılıyor. En yakın KFC’yi bul.',
  },
  // Varlık seçimleri: dosya yolları assets/kfc/ köküne göre; url alanı siteden doğrudan erişim için
  assets: {
    logo: { file: null, url: null },
    video: { file: null, url: null, poster: null },
    hero: { file: null, url: null },
    font: { family: null, faces: [] },
    products: [
      // { key: 'kova', name: 'Kova', file: 'img/....png', url: 'https://...', depth: 1 }
    ],
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
