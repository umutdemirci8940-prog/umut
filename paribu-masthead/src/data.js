'use strict';
/**
 * Paribu 970×250 interaktif masthead – tüm metinler, renkler, coinler, oyun ve süre ayarları.
 * Derleme: node build.js  (bkz. README)
 */
module.exports = {
  brand: {
    name: 'Paribu',
    site: 'https://www.paribu.com',
    // Tıklama hedefi (clickTag / Enabler tanımlı değilse). UTM parametreleri kampanyaya göre değiştirilebilir.
    url: 'https://www.paribu.com/?utm_source=display&utm_medium=masthead&utm_campaign=paribu-ilk-adim&utm_content=970x250-richmedia',
    domain: 'paribu.com',
    // true: oyun alanı dâhil bannerın her yeri tıklanınca siteye gider (bazı ağlar ister).
    // false: logo, başlık, CTA ve kampanya kartı siteye gider; oyun alanındaki tıklama "hamle" (cüzdan genişler).
    clickThroughEverywhere: false,
  },

  copy: {
    tagline: 'Türkiye’nin kripto para platformu',
    headline: ['Kripto dünyasına', 'ilk adımını at.'],           // 2. satır marka renginde
    sub: 'Al, sat, sakla. Hepsi tek uygulamada, 7/24.',
    cta: 'Hemen Başla',
    prompt: 'Cüzdanı imleçle yönlendir, coinleri yakala!',
    promptTouch: 'Cüzdanı parmağınla sürükle, coinleri yakala!',
    promptPlaying: 'Harika gidiyorsun!',
    portfolioLabel: 'Portföyüm',
    winHeadline: ['Portföyün hazır!', 'Şimdi Paribu’da kur.'],
    winCta: 'Paribu’ya Katıl',
    replay: 'Tekrar oyna',
    features: ['7/24 TL yatır–çek', 'Kolay üyelik', 'Güvenli saklama'],
    legal: 'Kripto varlıklar yüksek fiyat dalgalanması riski içerir; yatırım tavsiyesi değildir.',
    ariaLabel: 'Paribu – Kripto dünyasına ilk adımını at. İnteraktif masthead: cüzdanı yönlendirip coinleri yakala, Paribu’ya git.',
  },

  // Sağ üstteki kampanya kartı. Kaynak: ParibuLog "Paribu’dan yeni üyelere özel kampanya: 500 TL hediye".
  // Yayın öncesi kampanyanın güncelliği ve koşulları markayla teyit edilmeli; enabled:false ile kart yerine özellik çipleri gelir.
  campaign: {
    enabled: true,
    kicker: 'Yeni üyelere özel',
    value: '500 TL',
    suffix: 'hediye*',
    footnote: '*Kampanya koşulları geçerlidir.',
  },

  // Renkler: koyu "işlem ekranı" zemini + Paribu yeşili vurgu. tools/fetch-assets.js siteden theme-color ve
  // CSS renk adaylarını assets/manifest.json → colors altına yazar; build, manifest.colors.brand varsa onu kullanır.
  colors: {
    bg: '#070d1a',
    bg2: '#0d1b30',
    brand: '#14d26e',
    brand2: '#7ff2b6',
    brandDark: '#0a8f4a',
    ink: '#ffffff',
    muted: '#9db0c6',
    ctaText: '#04150c',
    up: '#14d26e',
    down: '#ff5c5c',
  },

  // Oyundaki coinler (ikonlar: assets/coins/<key>.svg – cryptocurrency-icons, CC0). Sıra = ağırlık; ilk 6 kullanılır.
  coins: [
    { key: 'btc', name: 'Bitcoin', symbol: 'BTC', color: '#F7931A' },
    { key: 'eth', name: 'Ethereum', symbol: 'ETH', color: '#627EEA' },
    { key: 'sol', name: 'Solana', symbol: 'SOL', color: '#66F9A1' },
    { key: 'avax', name: 'Avalanche', symbol: 'AVAX', color: '#E84142' },
    { key: 'xrp', name: 'XRP', symbol: 'XRP', color: '#23292F' },
    { key: 'doge', name: 'Dogecoin', symbol: 'DOGE', color: '#C3A634' },
  ],

  game: {
    target: 5,               // kazanmak için yakalanacak coin sayısı
    dropIdle: 2300,          // ms – kullanıcı yokken (otomatik gösteri) düşme aralığı
    dropPlay: 1150,          // ms – oynarken düşme aralığı
    gravity: 420,            // px/s²
    walletWidth: 92,         // px
    boostMs: 650,            // tıklama hamlesi süresi (cüzdan genişler, coinleri çeker)
    winHold: 4200,           // ms – kazanma ekranı süresi
    maxAutoplay: 30000,      // ms – etkileşim olmadan kendi kendine oynayan animasyonun üst sınırı (IAB/Google 30 sn)
  },

  timing: { intro: 3000 },   // ms – giriş kurgusu; oyun bundan sonra başlar

  fonts: {
    family: 'Sora',
    embed: true,             // true: assets/fonts/*.woff2 base64 gömülür (harici istek yok). false: Google Fonts <link>
    googleCss: 'https://fonts.googleapis.com/css2?family=Sora:wght@100..800&display=swap',
  },

  tracking: {
    // Zengin medya ağının sayaçları için: window.adTrack(name) tanımlıysa çağrılır, Enabler varsa Enabler.counter(name).
    // Olaylar: interaction, game_start, coin_catch, coin_miss, boost, game_win, replay, cta_click, exit
    enabled: true,
  },
};
