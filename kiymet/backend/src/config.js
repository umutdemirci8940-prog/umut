// Tüm ayarlar ortam değişkenlerinden okunur (bkz. .env.example).
const env = process.env;

const list = (value, fallback) =>
  (value ?? fallback)
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

export const config = {
  port: Number(env.PORT ?? 8080),
  // live: gerçek sağlayıcılar, demo: rastgele yürüyüşle sahte fiyatlar (geliştirme/test)
  dataMode: env.DATA_MODE === 'demo' ? 'demo' : 'live',
  // İstemcilere fiyat güncellemesi gönderme sıklığı (ms)
  broadcastIntervalMs: Number(env.BROADCAST_INTERVAL_MS ?? 1000),

  btcturk: {
    baseUrl: env.BTCTURK_BASE_URL ?? 'https://api.btcturk.com',
    pollMs: Number(env.BTCTURK_POLL_MS ?? 3000),
  },

  twelveData: {
    apiKey: env.TWELVEDATA_API_KEY ?? '',
    baseUrl: env.TWELVEDATA_BASE_URL ?? 'https://api.twelvedata.com',
    // Ücretsiz plan günlük kredi sınırlıdır; canlıda ücretli planla düşürün.
    pollMs: Number(env.TWELVEDATA_POLL_MS ?? 60000),
  },

  // Twelve Data anahtarı yoksa ons altın için yaklaşık kaynak (PAXG token fiyatı)
  binance: {
    baseUrl: env.BINANCE_BASE_URL ?? 'https://api.binance.com',
    pollMs: Number(env.BINANCE_POLL_MS ?? 15000),
  },

  tcmb: {
    todayUrl: env.TCMB_TODAY_URL ?? 'https://www.tcmb.gov.tr/kurlar/today.xml',
    pollMs: Number(env.TCMB_POLL_MS ?? 30 * 60 * 1000),
  },

  evds: {
    apiKey: env.EVDS_API_KEY ?? '',
    baseUrl: env.EVDS_BASE_URL ?? 'https://evds2.tcmb.gov.tr/service/evds',
    // TÜFE genel endeks serisi. TÜİK baz yılı değişirse buradan güncelleyin.
    cpiSeries: env.EVDS_CPI_SERIES ?? 'TP.FG.J0',
    refreshMs: Number(env.EVDS_REFRESH_MS ?? 6 * 60 * 60 * 1000),
  },

  stocks: {
    // BIST verisi lisanslıdır: yalnızca yeniden dağıtım (redistribution) hakkı olan bir planla kullanın.
    eodhdApiKey: env.EODHD_API_KEY ?? '',
    eodhdBaseUrl: env.EODHD_BASE_URL ?? 'https://eodhd.com/api',
    exchangeSuffix: env.STOCK_EXCHANGE_SUFFIX ?? 'IS',
    pollMs: Number(env.STOCK_POLL_MS ?? 60000),
    symbols: list(
      env.STOCK_SYMBOLS,
      'AKBNK,ASELS,BIMAS,EREGL,FROTO,GARAN,ISCTR,KCHOL,KOZAL,PGSUS,SAHOL,SASA,SISE,TCELL,THYAO,TOASO,TUPRS,YKBNK',
    ),
  },

  crypto: {
    // Katalogda gösterilecek popüler coinler; BtcTurk'teki diğer TRY pariteleri de otomatik eklenir.
    featured: list(env.CRYPTO_FEATURED, 'BTC,ETH,USDT,SOL,XRP,AVAX,DOGE,ADA,BNB,LINK'),
  },
};
