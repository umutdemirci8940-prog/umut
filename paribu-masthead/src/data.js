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
    tagline: 'Yarının dünyası şimdi daha geniş.',   // paribu.com ana sayfa başlığı
    headline: ['Kripto dünyasına', 'ilk adımını at.'],           // 2. satır marka renginde
    sub: 'Kripto al/sat, hisse, DeFi ve getiri. Hepsi tek uygulamada.',   // sitenin ürün başlıkları (paribu.com üst menü)
    cta: 'Hesap oluştur',            // sitenin birincil CTA metni
    cta2: 'Uygulamayı indir',        // sitenin ikincil CTA metni (hayalet düğme)
    prompt: 'Telefonu imleçle yönlendir, coinleri yakala!',
    promptTouch: 'Telefonu parmağınla sürükle, coinleri yakala!',
    promptTap: 'Coine tıkla → hemen düşer',
    phoneTitle: 'Portföyüm',
    phoneEmpty: 'Yakaladığın coinler burada birikir',
    phoneWin: 'Portföyün hazır!',
    combo: 'SERİ x{n}',
    winHeadline: ['Portföyün hazır!', 'Şimdi Paribu’da kur.'],
    winCta: 'Şimdi hesap oluştur',
    replay: 'Tekrar oyna',
    features: ['Kripto al/sat', 'Hisse', 'DeFi', 'Getiri'],   // paribu.com ana menüsündeki ürünler
    trust: ['Türk lirası ile yatır / çek', 'Uygulamadan ayrılmadan 7/24 destek'],   // paribu.com ana sayfa ifadeleri
    legal: 'Kripto varlıklar yüksek fiyat dalgalanması riski içerir; yatırım tavsiyesi değildir.',
    ariaLabel: 'Paribu – Kripto dünyasına ilk adımını at. İnteraktif masthead: telefonu yönlendirip coinleri yakala, Paribu’ya git.',
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

  // Renkler: koyu nötr zemin + Paribu limon yeşili. build.js marka rengini önce logonun SVG dolgusundan,
  // yoksa assets/manifest.json → colors.brand'dan alır; ikisi de yoksa buradaki brand kullanılır (--data-colors ile her zaman buradakiler).
  colors: {
    bg: '#12141a',           // sitenin koyu kart rengi ailesi (#121212 / #1f2229)
    bg2: '#1f2229',
    brand: '#9bba3c',        // Paribu limon yeşili (logo dolgusu, --color-foreground-accent)
    brand2: '#d6e57c',       // vurgu / kazanma satırı
    brandDark: '#5c7012',    // sitede --color-button-secondary-accent-text
    ink: '#ffffff',
    muted: '#a7afbb',
    ctaText: '#141a08',
    up: '#9bba3c',
    down: '#e53d3d',         // sitede --color-foreground-danger
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
    gravity: 440,            // px/s²
    phoneWidth: 126,         // px – telefonun genişliği (yakalama alanı)
    boostMs: 700,            // tıklama hamlesi süresi (mıknatıs dalgası, coinleri çeker)
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
