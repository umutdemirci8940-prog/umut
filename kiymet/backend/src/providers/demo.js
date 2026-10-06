import { CURRENCIES, stockSymbols } from '../instruments.js';

// İnternet/API anahtarı olmadan geliştirme için sahte fiyat üretici (rastgele yürüyüş).
// Değerler gerçeği yansıtmaz.

const SEED = {
  USDTRY: 41.5,
  XAUUSD: 3900,
  XAGUSD: 47,
  EUR: 48.6,
  GBP: 55.8,
  CHF: 52.1,
  CRYPTO: { BTC: 5_100_000, ETH: 185_000, USDT: 41.6, SOL: 9_400, XRP: 120, AVAX: 1_250, DOGE: 10.5, ADA: 35, BNB: 47_000, LINK: 900 },
};

const walk = (v, vol) => v * (1 + (Math.random() - 0.5) * vol);

export function startDemo(store, intervalMs = 1500) {
  const state = {
    USDTRY: { price: SEED.USDTRY, prevClose: SEED.USDTRY * 0.998 },
    XAUUSD: { price: SEED.XAUUSD, prevClose: SEED.XAUUSD * 0.992 },
    XAGUSD: { price: SEED.XAGUSD, prevClose: SEED.XAGUSD * 1.004 },
  };
  const fx = Object.fromEntries(CURRENCIES.filter((c) => c.code !== 'USD').map((c) => [c.code, SEED[c.code] ?? 10]));
  const crypto = { ...SEED.CRYPTO };
  const stocks = {};
  const cryptoOpen = { ...crypto };
  const stockOpen = {};

  const tick = () => {
    for (const key of Object.keys(state)) {
      state[key].price = walk(state[key].price, 0.0015);
      store.setRaw(key, { ...state[key], source: 'demo', priority: 9 });
    }
    store.set('FX:USD', { ...state.USDTRY, source: 'demo' });
    for (const code of Object.keys(fx)) {
      const prev = fx[code];
      fx[code] = walk(prev, 0.0015);
      store.set(`FX:${code}`, { price: fx[code], prevClose: (SEED[code] ?? prev) * 0.998, source: 'demo' });
    }
    for (const code of Object.keys(crypto)) {
      crypto[code] = walk(crypto[code], 0.006);
      store.set(`CRYPTO:${code}`, { price: crypto[code], prevClose: cryptoOpen[code], source: 'demo' });
    }
    for (const code of stockSymbols()) {
      // Sembolden türetilmiş sabit başlangıç fiyatı
      const base = 20 + ([...code].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 400);
      stocks[code] = walk(stocks[code] ?? base, 0.003);
      stockOpen[code] ??= base;
      store.set(`STOCK:${code}`, { price: stocks[code], prevClose: stockOpen[code], source: 'demo' });
    }
  };

  tick();
  const timer = setInterval(tick, intervalMs);
  return () => clearInterval(timer);
}

/** Demo modunda enflasyon serisi: aylık ~%2,5 artan TÜFE endeksi. */
export function demoCpiSeries(months = 60) {
  const out = [];
  const now = new Date();
  let index = 1000;
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1 - i, 1));
    out.push({ month: d.toISOString().slice(0, 7), index: Math.round(index * 100) / 100 });
    index *= 1.025;
  }
  return out;
}
